export function generateTestUuid(type: 'user' | 'comp' | 'team' | 'match' | 'pred', index: number): string {
  const prefixes = { user: '1', comp: '2', team: '3', match: '4', pred: '5' };
  const hexIndex = index.toString(16).padStart(12, '0');
  return `00b5eb2d-${prefixes[type]}000-4000-9000-${hexIndex}`;
}

export function generateFakeUser(index: number) {
  return {
    id: generateTestUuid('user', index),
    username: "testUsername",
    email: `test${index}@mail.com`,
    password_hash: "testPasswordHash",
  }
}
