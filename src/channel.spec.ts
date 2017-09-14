import * as test from "blue-tape";
import { delay } from "promise-u";
import { Channel, ReceiveChannel, SendChannel } from "./channel";

test("create channel", async (t) => {
    const channel = new Channel();
    t.equal(channel.bufferSize, 0);
});
