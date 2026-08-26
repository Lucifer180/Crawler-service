export function normalizePrice(text:string):number{
    return Number(text.replace(/[^\d]/g, ""))
}