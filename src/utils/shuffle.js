export const shuffle = arr => {
    const copy = [...arr];

    const result = [];

    while (copy.length > 0) {
        result.push(...copy.splice(Math.random() * copy.length ^ 0, 1));
    }

    return result;
}

export const shuffleValues = arr => {
    const values = arr.map(el => el.value);
    const shuffled = shuffle(values);
    return arr.map((el, i) => ({...el, value: shuffled[i]}));
}