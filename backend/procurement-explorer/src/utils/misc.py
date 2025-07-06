import signal


class TimeoutException(Exception):
    def __init__(self, message=None):
        if message is None:
            message = "Function execution has timed out"
        super().__init__(message)


# Timeout handler
def timeout_handler(signum, frame):
    raise TimeoutException("The function has timed out and will be terminated")


# Function decorator to add timeout
def timeout(seconds):
    def decorator(func):
        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result

        return wrapper

    return decorator
