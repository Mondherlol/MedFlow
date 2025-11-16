function getMonday(d) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // make Monday=0
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
}

function formatDateYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}


export { getMonday, formatDateYMD };