import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildUsername(firstName: string, middleName: string, lastName: string) {
  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join('.')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '')
}
