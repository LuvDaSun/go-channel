import * as test from "blue-tape";
import { Channel } from "./channel";

// https://tour.golang.org/concurrency/2
test("Channels", async (t) => {
    const fmt = [] as number[];

    // func sum(s []int, c chan int) {
    const sum = async (s: number[], c: Channel<number>) => {
        // sum := 0
        // tslint:disable-next-line:no-shadowed-variable
        let sum = 0;

        // for _, v := range s {
        for (const v of s) {
            // sum += v
            sum += v;
        }

        // 	c <- sum // send sum to c
        await c.send(sum);
    };

    // func main() {
    const main = async () => {
        // s := []int{7, 2, 8, -9, 4, 0}
        const s = [7, 2, 8, -9, 4, 0];

        // c := make(chan int)
        const c = new Channel<number>();

        // go sum(s[:len(s)/2], c)
        sum(s.slice(s.length / 2), c);

        // go sum(s[len(s)/2:], c)
        sum(s.slice(0, s.length / 2), c);

        // x, y := <-c, <-c // receive from c
        const [x, y] = [await c.receive(), await c.receive()];

        // fmt.Println(x, y, x+y)
        fmt.push(x, y, x + y);
    };

    await main();
    t.equal(-5, fmt.shift());
    t.equal(17, fmt.shift());
    t.equal(12, fmt.shift());
});

// https://tour.golang.org/concurrency/3
test("Buffered Channels", async (t) => {
    const fmt = [] as number[];

    // func main() {
    const main = async () => {
        // ch := make(chan int, 2)
        const ch = new Channel<number>(2);

        // ch <- 1
        ch.send(1);

        // ch <- 2
        ch.send(2);

        // fmt.Println(<-ch)
        fmt.push(await ch.receive());

        // fmt.Println(<-ch)
        fmt.push(await ch.receive());
    };

    await main();
    t.equal(1, fmt.shift());
    t.equal(2, fmt.shift());
});

// https://tour.golang.org/concurrency/4
test.skip("Range and Close", async (t) => {
    const fmt = [] as number[];

    // func fibonacci(n int, c chan int) {
    const fibonacci = async (n: number, c: Channel<number>) => {
        // x, y := 0, 1
        let [x, y] = [0, 1];

        // for i := 0; i < n; i++ {
        for (let i = 0; i < n; i++) {

            // c <- x
            await c.send(x);

            // x, y = y, x+y
            [x, y] = [y, x + y];
        }

        // close(c)
        await c.close();
    };

    // func main() {
    const main = async () => {
        // c := make(chan int, 10)
        const c = new Channel<number>(10);

        // go fibonacci(cap(c), c)
        fibonacci(c.bufferSize, c);

        // for i := range c {
        for (const i of c) {

            // fmt.Println(i)
            fmt.push(i);
        }
    };

    await main();
    t.equal(0, fmt.shift());
    t.equal(1, fmt.shift());
    t.equal(1, fmt.shift());
    t.equal(2, fmt.shift());
    t.equal(3, fmt.shift());
    t.equal(5, fmt.shift());
    t.equal(8, fmt.shift());
    t.equal(13, fmt.shift());
    t.equal(21, fmt.shift());
    t.equal(34, fmt.shift());
});
