
interface Item {
	name:		string;
    selection:  string;
	onClick:	null | ((e: any) => void);
};

export { type Item };
