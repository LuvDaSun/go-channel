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
    private readonly sendQueue = new Array<Deferred<void>>();
    private readonly receiveQueue = new Array<Deferred<T>>();
    private readonly messageBuffer = new Array<T>();
    public constructor(public readonly bufferSize = 0) {
    }

    public [Symbol.iterator](): Iterator<T> {
        throw new Error("Not implemented!");
    }

    public async send(message: T): Promise<void> {
        this.messageBuffer.push(message);

        const deferred = defer<void>();
        this.sendQueue.push(deferred);
        this.flush();

        return await deferred.promise;
    }

    public async receive(): Promise<T> {
        const deferred = defer<T>();
        this.receiveQueue.push(deferred);
        this.flush();
        return await deferred.promise;
    }

    public async close(): Promise<void> {
        throw new Error("Not implemented!");
    }

    private flush() {
        for (
            let i = 0;
            i < this.sendQueue.length && i < this.receiveQueue.length;
            i++
        ) {
            const sender = this.sendQueue.shift();
            const receiver = this.receiveQueue.shift();
            const message = this.messageBuffer.shift();

            if (sender === undefined) throw new Error("missing sender");
            if (receiver === undefined) throw new Error("missing sender");
            if (message === undefined) throw new Error("missing message");

            sender.resolve(undefined);
            receiver.resolve(message);
        }
    }

}
