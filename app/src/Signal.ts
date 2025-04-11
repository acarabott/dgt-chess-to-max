export type Listener<T> = (value: T) => void;

export class Signal<T> {
    private listeners = new Set<Listener<T>>();

    public listen(listener: Listener<T>) {
        this.listeners.add(listener);

        return () => this.listeners.delete(listener);
    }

    public notify(value: Readonly<T>) {
        for (const listener of this.listeners) {
            listener(value);
        }
    }
}
