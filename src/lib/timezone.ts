import { formatInTimeZone, toDate } from 'date-fns-tz'

const FLORIDA_TZ = 'America/New_York'

/**
 * Formata uma data para o fuso horário da Flórida (EST/EDT)
 * @param date Data original
 * @param formatStr Padrão de formatação (ex: 'yyyy-MM-dd HH:mm:ss')
 * @returns String formatada
 */
export function formatFlorida(date: Date | string | number, formatStr: string = 'yyyy-MM-dd HH:mm:ss') {
    return formatInTimeZone(date, FLORIDA_TZ, formatStr)
}

/**
 * Converte uma data fuso local ou UTC para o objeto Date "na Flórida"
 */
export function getFloridaDate(date: Date | string | number = new Date()) {
    return toDate(date, { timeZone: FLORIDA_TZ })
}

/**
 * Parses a string in Florida's wall-clock time (e.g., '2026-03-07T22:16') to a proper UTC ISO string for the database.
 */
import { fromZonedTime } from 'date-fns-tz'
export function parseFloridaTime(localDateTimeString: string): string {
    const d = fromZonedTime(localDateTimeString, FLORIDA_TZ)
    return d.toISOString()
}

/**
 * Retorna o offset atual da Flórida em relação ao UTC
 */
export function getFloridaOffset() {
    const date = new Date()
    const floridaDate = getFloridaDate(date)
    return (date.getTime() - floridaDate.getTime()) / (60 * 60 * 1000)
}
