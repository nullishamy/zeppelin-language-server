export interface TagValue {
	key: string;
	type: string;
	kind: 'root' | 'child';
}

const USER_PROPERTIES = [
	'user.username',
	'user.id',
	'user.discriminator',
	'user.bot',
	'user.system',
	'user.publicFlags'
]

export const VALUES: TagValue[] = [
	{ key: 'user', type: 'object', kind: 'root' },

	...Array.from(USER_PROPERTIES).map(prop => ({
		key: prop,
		type: 'string',
		kind: 'child'
	}) as const),

	{ key: 'member', type: 'object', kind: 'root' },

	...Array.from(USER_PROPERTIES).map(prop => ({
		key: `member.${prop}`,
		type: 'string',
		kind: 'child'
	}) as const),

	{ key: 'member.joinedAt', type: 'number', kind: 'child' },

	{ key: 'args', type: 'object', kind: 'root' },

	// Args can have more values than this, though anything more is
	// uncommon so it's not worth generating for
	...Array.from({ length: 15 }).map((_, i) => ({
		key: `args.${i}`,
		type: 'string',
		kind: 'child'
	} as const)),
];
