import * as test from "blue-tape";
import { delay } from "promise-u";
import { Channel, ReceiveChannel, SendChannel } from "./channel";

// https://gobyexample.com/channels
test("Go by Example: Channels", async (t) => {
    const fmt = [] as string[];

    // func main() {
    const main = async () => {
        // messages := make(chan string)
        const message = new Channel<string>();

        // go func() { messages <- "ping" }()
        (async () => await message.send("ping"))();

        // msg := <-messages
        const msg = await message.receive();

        // fmt.Println(msg)
        fmt.push(msg);
    };

    await main();
    t.equal("ping", fmt.shift());
});

// https://gobyexample.com/channel-buffering
test("Go by Example: Channel Buffering", async (t) => {
    const fmt = [] as string[];

    // func main() {
    const main = async () => {
        // messages := make(chan string, 2)
        const message = new Channel<string>(2);

        // messages <- "buffered"
        await message.send("buffered");

        // messages <- "channel"
        await message.send("channel");

        // fmt.Println(<-messages)
        fmt.push(await message.receive());

        // fmt.Println(<-messages)
        fmt.push(await message.receive());
    };

    await main();
    t.equal("buffered", fmt.shift());
    t.equal("channel", fmt.shift());
});

// https://gobyexample.com/channel-synchronization
test("Go by Example: Channel Synchronization", async (t) => {
    const fmt = [] as string[];

    // func worker(done chan bool) {
    const worker = async (done: Channel<boolean>) => {
        // fmt.Print("working...")
        fmt.push("working...");

        // time.Sleep(time.Second)
        await delay(1000);

        // fmt.Println("done")
        fmt.push("done");

        // done <- true
        await done.send(true);
    };

    // func main() {
    const main = async () => {
        // done := make(chan bool, 1)
        const done = new Channel<boolean>(1);

        // go worker(done)
        worker(done);

        // <-done
        await done.receive();
    };

    await main();
    t.equal("working...", fmt.shift());
    t.equal("done", fmt.shift());
});

// https://gobyexample.com/channel-directions
test("Go by Example: Channel Directions", async (t) => {
    const fmt = [] as string[];

    // func ping(pings chan<- string, msg string) {
    const ping = async (pings: SendChannel<string>, msg: string) => {
        // pings <- msg
        await pings.send(msg);
    };

    // func pong(pings <-chan string, pongs chan<- string) {
    const pong = async (
        pings: ReceiveChannel<string>,
        pongs: SendChannel<string>,
    ) => {
        // msg := <-pings
        const msg = await pings.receive();

        // pongs <- msg
        await pongs.send(msg);
    };

    // func main() {
    const main = async () => {
        // pings := make(chan string, 1)
        const pings = new Channel<string>(1);

        // pongs := make(chan string, 1)
        const pongs = new Channel<string>(1);

        // ping(pings, "passed message")
        ping(pings, "passed message");

        // pong(pings, pongs)
        pong(pings, pongs);

        // fmt.Println(<-pongs)
        fmt.push(await pongs.receive());
    };

    await main();
    t.equal("passed message", fmt.shift());
});

// https://gobyexample.com/closing-channels
test.skip("Go by Example: Closing Channels", async (t) => {
    const fmt = [] as string[];

    // func main() {
    const main = async () => {
        // jobs := make(chan int, 5)
        const jobs = new Channel<number>(5);
        // done := make(chan bool)
        const done = new Channel<boolean>();

        // go func() {
        (async () => {
            // for {
            while (true) {
                // j, more := <-jobs
                const j = await jobs.receive();

                // if more {
                if (j !== undefined) {
                    // fmt.Println("received job", j)
                    fmt.push(`received job ${j}`);
                }
                // } else {
                else {
                    // fmt.Println("received all jobs")
                    fmt.push("received all jobs");

                    // done <- true
                    await done.send(true);

                    // return
                    return;
                }
            }
        })();

        // for j := 1; j <= 3; j++ {
        for (let j = 1; j <= 3; j++) {
            // jobs <- j
            await jobs.send(j);
            // fmt.Println("sent job", j)
            fmt.push(`sent job ${j}`);
        }
        // close(jobs)
        await jobs.close();
        // fmt.Println("sent all jobs")
        fmt.push("sent all jobs");

        // <-done
        await done.receive();
    };

    await main();
    t.equal("sent job 1", fmt.shift());
    t.equal("received job 1", fmt.shift());
    t.equal("sent job 2", fmt.shift());
    t.equal("received job 2", fmt.shift());
    t.equal("sent job 3", fmt.shift());
    t.equal("received job 3", fmt.shift());
    t.equal("sent all jobs", fmt.shift());
    t.equal("received all jobs", fmt.shift());
});
