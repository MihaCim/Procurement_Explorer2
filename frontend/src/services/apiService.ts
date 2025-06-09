function JSON_to_URLEncoded(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any,
  key?: string,
  list?: string[],
): string[] {
  list = list || [];
  if (typeof element === 'object') {
    for (const idx in element) {
      JSON_to_URLEncoded(element[idx], key ? key + '[' + idx + ']' : idx, list);
    }
  } else {
    list.push(key + '=' + encodeURIComponent(element));
  }
  return list;
}

export default class APIService {
  // protected apikey: string;

  private DEFAULT_HEADERS: Record<string, string>;

  constructor() {
    // this.apikey = apikey;
    this.DEFAULT_HEADERS = {
      'Content-Type': 'application/json',
      accept: 'application/json',
      // "X-API-Key": this.apikey,
    };
  }
  public async get(url: string) {
    return await this.fetchBase(url);
  }
  public async getBlob(url: string) {
    const response = await fetch(url, {
      headers: { ...this.DEFAULT_HEADERS },
    });
    if (!response.ok) {
      throw new Response(response.statusText, { status: response.status });
    }
    return await response.blob();
  }

  public async postBlob(url: string, data: unknown) {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { ...this.DEFAULT_HEADERS },
    });
    if (!response.ok) {
      throw new Response(response.statusText, { status: response.status });
    }
    return await response.blob();
  }

  public async postMultipart(url: string, data: FormData) {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      body: data,
      // headers: { "X-API-Key": this.apikey },
    });

    if (!response.ok) {
      const errorContent = (await response.json()) as Error;
      console.log('errorContent', errorContent);
      if (errorContent.message) {
        return Promise.reject(errorContent);
      }

      throw new Response(response.statusText, { status: response.status });
    }
    return await response.json();
  }

  public async post(url: string, data: unknown, urlEncoded?: boolean) {
    return await this.fetchBase(url, {
      method: 'POST',
      body: urlEncoded
        ? JSON_to_URLEncoded(data).join('&')
        : JSON.stringify(data),
      headers: {
        'Content-Type': urlEncoded
          ? 'application/x-www-form-urlencoded; charset=UTF-8'
          : 'application/json',
      },
    });
  }
  public async delete(url: string) {
    return await this.fetchBase(url, {
      method: 'DELETE',
    });
  }
  public async put(url: string, data: unknown) {
    return await this.fetchBase(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  public async patch(url: string, data: unknown, urlEncoded?: boolean) {
    return await this.fetchBase(url, {
      method: 'PATCH',
      body: urlEncoded
        ? JSON_to_URLEncoded(data).join('&')
        : JSON.stringify(data),
      headers: {
        'Content-Type': urlEncoded
          ? 'application/x-www-form-urlencoded; charset=UTF-8'
          : 'application/json',
      },
    });
  }
  public async head(url: string) {
    return await this.fetchBase(url, {
      method: 'HEAD',
    });
  }
  public async options(url: string) {
    return await this.fetchBase(url, {
      method: 'OPTIONS',
    });
  }

  protected async fetchBase(url: string, options?: RequestInit) {
    const response = await fetch(`/api${url}`, {
      ...options,
      headers: { ...this.DEFAULT_HEADERS, ...options?.headers },
    });
    if (!response.ok) {
      const errorContent = (await response.json()) as Error;
      console.log('errorContent', errorContent);
      if (errorContent.message) {
        return Promise.reject(errorContent);
      }

      throw new Response(response.statusText, { status: response.status });
    }
    return await response.json();
  }
}
