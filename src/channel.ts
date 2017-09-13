export interface ReceiveChannel<T = any> {
    receive(): Promise<T>;
}

export interface SendChannel<T = any> {
    send(message: T): Promise<void>;
}

export class Channel<T = any>
    implements ReceiveChannel<T>, SendChannel<T>
{
    private readonly buffer: any[];

    public constructor(public readonly bufferSize: number = 0) {
        this.buffer = new Array<any>(bufferSize);
    }

    public send(message: T): Promise<void> {
        throw new Error("Not implemented!");
    }

    public receive(): Promise<T> {
        throw new Error("Not implemented!");
    }
}
