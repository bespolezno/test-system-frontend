export const http = async request => {
    try {
        const response = await fetch(request);
        const data = await response.json();
        const code = response.status;
        return {response, data, code}
    } catch (error) {
        return {error}
    }
}

export const API_HOST = 'http://m1/api/'

export const apiRequest = (path, method = 'GET', body = null, headers = {}) => {
    return new Request(`${API_HOST}${path}`, {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : null
    })
}
export const httpApi = async (path, method = 'GET', body = null) => {
    const res = await http(apiRequest(path, method, body, {'Authorization': `Bearer ${localStorage.token}`}))
    if (res.code === 401) throw new Error('Unauthorized')
    return res;
}

const addEntry = (obj, value, items, index = 0) => {
    const key = items[index];
    const nextKey = items[index + 1];
    const current = items.slice(0, index).reduce((acc, cur) => acc[cur], obj);

    if (!current[key]) {
        if (Number.isInteger(+nextKey)) {
            current[key] = []
        } else {
            current[key] = {}
        }
    }

    if (items.length - index <= 1) {
        current[key] = value;
        return;
    }

    addEntry(obj, value, items, index + 1);
}

export const parseErrors = errors => {
    const result = {};
    const entries = Object.entries(errors);

    entries.forEach(([key, value]) => {
        const items = key.split('.');
        addEntry(result, value, items);
    });

    return result;
}