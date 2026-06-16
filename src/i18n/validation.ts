import type { TFunction } from 'i18next'

export function validationMessages(t: TFunction) {
  return {
    required: () => t('validation.required'),
    invalidEmail: () => t('validation.invalidEmail'),
    minChars: (n: number) => t('validation.minChars', { n }),
    maxChars: (n: number) => t('validation.maxChars', { n }),
    positive: () => t('validation.positive'),
    notNegative: () => t('validation.notNegative'),
    passwordMatch: () => t('validation.passwordMatch'),
    aliasFormat: () => t('validation.aliasFormat'),
    selectCard: () => t('validation.selectCard'),
    minPercent: (n: number) => t('validation.minPercent', { n }),
    maxPercent: (n: number) => t('validation.maxPercent', { n }),
    exactFourDigits: () => t('validation.exactFourDigits'),
    describeReason: (n: number) => t('validation.minChars', { n }),
    passwordUppercase: () => t('validation.passwordUppercase'),
    passwordLowercase: () => t('validation.passwordLowercase'),
    passwordNumber: () => t('validation.passwordNumber'),
  }
}

export type ValidationMessages = ReturnType<typeof validationMessages>
