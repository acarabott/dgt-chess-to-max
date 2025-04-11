import { Resource } from "../lib/resource";

export interface ResourceObjectMixin {
    readonly resourceController: {
        removeAllListeners(): void;
        createResource(id: number): Resource;
    };

    getResourceCount(): number;
    getResourceAtIndex(idx: number): Resource;

    addParam(param: {
        type: string;
        value: any;
        on(event: "change", listener: (param: any) => void): void;
    }): void;
    destroy(): void;
}

export declare const ResourceObjectMixin: <T extends new (...args: any[]) => object>(
    Base: T,
) => T & (new (...args: any[]) => ResourceObjectMixin);
