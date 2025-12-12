export const ALLOWED_ADMIN_IDS = [
    '7f90037e-5cff-4086-b6d7-4b48a796104b',
    'ce480f61-74a5-4ce7-bbab-3ee386f8f776',
    '2d033d93-5281-4580-81de-0b143abbf6ce'
];

export const isAdminUser = (userId?: string | null) => {
    if (!userId) return false;
    return ALLOWED_ADMIN_IDS.includes(userId);
};
