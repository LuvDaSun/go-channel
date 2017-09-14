import { defer, Deferred } from "promise-u";

export interface ReceiveChannel<T = any> {
    receive(): Promise<T>;
}

export interface SendChannel<T = any> {
    send(message: T): Promise<void>;
}

export class Channel<T = any>
    implements ReceiveChannel<T>, SendChannel<T>, Iterable<T>
{
    private sender: Deferred<void> | null = null;
    private receiver: Deferred<T> | null = null;

    private readonly messageBuffer = new Array<T>();
    public constructor(public readonly bufferSize = 0) {
    }

    public [Symbol.iterator](): Iterator<T> {
        throw new Error("Not implemented!");
    }

    public async send(message: T): Promise<void> {
        if (message === undefined) throw new Error("message cannot be undefined");
        if (this.sender) await this.sender.promise;

        if (this.receiver !== null) {
            this.receiver.resolve(message);
            this.receiver = null;
            return;
        }

        if (this.messageBuffer.length < this.bufferSize) {
            this.messageBuffer.push(message);
            return;
        }

        this.sender = defer<void>();
        await this.sender.promise;
        await this.send(message);
    }

    public async receive(): Promise<T> {
        if (this.receiver !== null) throw new Error("already receiving!");

        if (this.sender !== null) {
            this.sender.resolve(undefined);
            this.sender = null;
        }

        {
            const message = this.messageBuffer.shift();
            if (message !== undefined) {
                return message;
            }
        }

        {
            this.receiver = defer<T>();
            const message = await this.receiver.promise;
            return message;
        }
    }

    public async close(): Promise<void> {
        throw new Error("Not implemented!");
    }

}
