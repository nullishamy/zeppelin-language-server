export interface TagValue {
	key: string;
	type: string;
	kind: 'root' | 'child';
}

const USER_PROPERTIES = [
	{key: 'user.username', type: 'string'},
	{key: 'user.id', type: 'number'},
	{key: 'user.discriminator', type: 'number'},
	{key: 'user.bot', type: 'boolean'},
	{key: 'user.system', type: 'boolean'},
	{key: 'user.publicFlags', type: 'number'}
]

export const VALUES: TagValue[] = [
	{ key: 'user', type: 'object', kind: 'root' },

	...Array.from(USER_PROPERTIES).map(prop => ({
		key: prop.key,
		type: prop.type,
		kind: 'child'
	}) as const),

	{ key: 'member', type: 'object', kind: 'root' },

	...Array.from(USER_PROPERTIES).map(prop => ({
		key: `member.${prop.key}`,
		type: prop.type,
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
