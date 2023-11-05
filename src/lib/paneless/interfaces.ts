
interface Item {
	name:		string;
    selection:  string;
	enabled:	boolean;
	onClick:	null | ((e: any) => void);
};

export { type Item };
