import { FC } from 'react';
import type { ReactNode } from 'react';

type user = { id: number };
const x: any = 1;
const y = x!;
const xs: Array<string> = [];
const inc = (n: number) => n + 1;

type Node = ReactNode;
type Comp = FC;

export { x, y, xs, inc };
export type { Comp, Node };
