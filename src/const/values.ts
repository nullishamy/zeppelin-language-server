export interface TagValue {
	key: string;
	type: string;
	kind: 'root' | 'child';
}

export const VALUES: TagValue[] = [
	{ key: 'user', type: 'object', kind: 'root' },
	{ key: 'user.username', type: 'string', kind: 'child' },
	{ key: 'user.id', type: 'string', kind: 'child' },
	{ key: 'user.discriminator', type: 'number', kind: 'child' },
	{ key: 'user.bot', type: 'boolean', kind: 'child' },
	{ key: 'user.system', type: 'boolean', kind: 'child' },
	{ key: 'user.publicFlags', type: 'number', kind: 'child' },

	{ key: 'member', type: 'object', kind: 'root' },

	// FIXME: dynamic generation
	{ key: 'member.user', type: 'user', kind: 'child' },
	{ key: 'member.user.username', type: 'string', kind: 'child' },
	{ key: 'member.user.id', type: 'string', kind: 'child' },
	{ key: 'member.user.discriminator', type: 'number', kind: 'child' },
	{ key: 'member.user.bot', type: 'boolean', kind: 'child' },
	{ key: 'member.user.system', type: 'boolean', kind: 'child' },
	{ key: 'member.user.publicFlags', type: 'number', kind: 'child' },

	{ key: 'member.joinedAt', type: 'number', kind: 'child' },

	{ key: 'args', type: 'object', kind: 'root' },

	// Args can have more values than this, though anything more is
	// uncommon so it's not worth generating for
	...Array.from({ length: 15 }).map((_, i) => ({
		key: `args.${i}`,
		type: 'string',
		kind: 'child',
	} as const)),
];
