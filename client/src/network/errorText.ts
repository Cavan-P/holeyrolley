import type { ErrorReason } from './connection'

export const ERROR_TEXT: Record<ErrorReason, string> = {
    notFound: "There's no party with that code.",
    full: 'That party is full.'
}
