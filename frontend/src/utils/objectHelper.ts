function nullToUndefined(object: object) {
    return Object.fromEntries(
        Object.entries(object).map(([k, v]) => [k, v === null ? undefined : v])
    );
}

export default nullToUndefined;
