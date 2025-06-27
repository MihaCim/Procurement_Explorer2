import asyncio
import os
import sys

import uvicorn
from company_data import CompanyData
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from logger import BasicLogger
from prompts.prompts2 import Prompts
from thread import TaskThread

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

app = FastAPI()
prompts = Prompts()
company_data = CompanyData()


logger = BasicLogger()


@app.websocket("/ws/profile/{company_name}")
async def websocket_profile(websocket: WebSocket, company_name: str):
    await websocket.accept()
    print(f"WebSocket received request: {company_name}")

    system_prompt = prompts.get_system_prompt(company_name)
    taskThread = TaskThread(
        task=system_prompt,
        logger=logger,
    )

    update_event = asyncio.Event()  # Event to track profile updates
    log_queue = asyncio.Queue()  # Queue to store AI chat messages

    async def monitor_profile():
        """Monitor profile and trigger update event when data changes."""
        prev_data = None
        while not taskThread.is_finished:
            new_data = (
                taskThread.company_data.to_json() if taskThread.company_data else None
            )
            if new_data and new_data != prev_data:
                prev_data = new_data
                update_event.set()  # Notify that profile has changed
            await asyncio.sleep(1)  # Faster updates

    async def monitor_logs():
        """Monitor AI chat logs and push new messages to the queue."""
        prev_log_data = None
        while not taskThread.is_finished:
            new_log_data = taskThread.chat
            if new_log_data and new_log_data != prev_log_data:
                prev_log_data = new_log_data
                await log_queue.put(new_log_data)  # Store log message in queue
            await asyncio.sleep(1)

    async def send_updates():
        """Send updates when new profile data or chat logs are available."""
        while not taskThread.is_finished:
            # Wait for either an event or a new log message
            profile_update_task = asyncio.create_task(update_event.wait())
            log_message_task = asyncio.create_task(log_queue.get())

            done, pending = await asyncio.wait(
                {profile_update_task, log_message_task},
                return_when=asyncio.FIRST_COMPLETED,
            )

            if profile_update_task in done:
                update_event.clear()  # Reset event after handling
                if taskThread.company_data:
                    await websocket.send_json(
                        {"type": "profile", "data": taskThread.company_data.to_json()}
                    )

            if log_message_task in done:
                message = log_message_task.result()  # Get the log message
                await websocket.send_json({"type": "chat", "data": message})

            # Cancel any unfinished tasks
            for task in pending:
                task.cancel()

    try:
        # Start the task thread
        taskThread_task = asyncio.create_task(taskThread.run())

        # Run the monitoring and sending loops concurrently
        await asyncio.gather(
            taskThread_task, monitor_profile(), monitor_logs(), send_updates()
        )

        # Send final report when task completes
        await websocket.send_json({"type": "final_report", "data": taskThread.result})

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from {company_name}")
    except Exception as e:
        logger.error(f"Error: {e}")
        await websocket.send_json({"type": "error", "data": str(e)})


@app.get("/profile/{company_name}")
async def generate_profile(company_name: str):
    """
    Generate a company profile for the given company_name via HTTP GET.
    This endpoint runs the same logic as the WebSocket but returns the final result directly.
    """
    try:
        system_prompt = prompts.get_system_prompt(company_name)
        taskThread = TaskThread(
            task=system_prompt,
            logger_main=logger_main,
            logger_logs=logger_logs,
        )

        await taskThread.run()

        if taskThread.result:
            return JSONResponse(content={"status": "success", "profile": taskThread.result})
        else:
            return JSONResponse(status_code=500, content={"status": "error", "message": "Profile generation failed"})

    except Exception as e:
        logger_main.error(f"Error generating profile for {company_name}: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8055)
