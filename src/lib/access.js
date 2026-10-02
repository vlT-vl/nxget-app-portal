export const VLT_CATEGORY = 'vlT Software'

export const isVoucherGated = app => app.access === 'voucher' || app.category === VLT_CATEGORY
