//import { validateAddress } from "./address_tools"

export const payment_id = (input) => {
    return input.length === 0 || (/^[0-9A-Fa-f]+$/.test(input) && (input.length == 16 || input.length == 64))
}

export const address = (input) => {

    if(!(/^[0-9A-Za-z]+$/.test(input))) return false

    switch (input.substring(0,1)) {
        case "M":
            return input.length === 95

        default:
            break
    }

    switch (input.substring(0,2)) {
        case "bT":
            return input.length === 97

        default:
            return false
    }
}
