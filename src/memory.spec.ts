import { MemoryStream } from "./memory";
import { expect } from "chai";

describe("memory streams", () =>
{
    let stream!: MemoryStream;

    beforeEach(async () =>
    {
        stream = new MemoryStream({ data: Buffer.from("hello") });
    });

    afterEach(async () => 
    {
        await stream.close();
    });

    it("canRead, canWrite, canSeek should be true", () =>
    {
        expect(stream.canSeek).to.be.true;
        expect(stream.canRead).to.be.true;
        expect(stream.canWrite).to.be.true;
    });

    it("length and position should be correct", () =>
    {
        expect(stream.position).to.equal(0);
        expect(stream.length).to.equal(5);
    });

    it("should read data correctly", async () =>
    {
        const buf = await stream.read(5);
        expect(buf.toString("utf-8")).to.equal("hello");
        expect(stream.position).to.equal(5);
    });

    it("should read data correctly after seeking", async () =>
    {
        // should seek correctly
        expect(await stream.seek(2)).to.be.true;
        expect(stream.position).to.equal(2);

        // and read the data
        const buf = await stream.read(2);
        expect(buf.toString("utf-8")).to.equal("ll");
        expect(stream.position).to.equal(4);
    });

    it("should write data correctly", async () =>
    {
        let buf = Buffer.from("adios");
        expect(await stream.write(buf)).to.equal(5);
        await stream.seek(0);

        buf = await stream.read(5);
        expect(buf.toString("utf-8")).to.equal("adios");
    });

    it("should write data correctly after seeking", async () =>
    {
        let buf = Buffer.from("adios");
        expect(await stream.seek(2)).to.be.true;
        expect(await stream.write(buf)).to.equal(5);

        await stream.seek(0);
        buf = await stream.read(7);
        expect(buf.toString("utf-8")).to.equal("headios");
    });

    it("should not allow operations after closing", async () =>
    {
        expect(async () =>
        {
            await stream.close();
            await stream.seek(2);
        }).to.throw;

        expect(async () =>
        {
            await stream.close();
            await stream.read(2);
        }).to.throw;

        expect(async () =>
        {
            await stream.close();
            await stream.write(Buffer.from("oops"));
        }).to.throw;
    });
});

describe("readonly memory streams", () =>
{
    let stream!: MemoryStream;

    beforeEach(async () =>
    {
        const buf = Buffer.from("hello");

        stream = new MemoryStream({ data: buf, readonly: true });
    });

    afterEach(async () => 
    {
        await stream.close();
    });

    it("canRead, canSeek should be true, canWrite should be false", () =>
    {
        expect(stream.canSeek).to.be.true;
        expect(stream.canRead).to.be.true;
        expect(stream.canWrite).to.be.false;
    });

    it("length and position should be correct", () =>
    {
        expect(stream.position).to.equal(0);
        expect(stream.length).to.equal(5);
    });

    it("should read data correctly", async () =>
    {
        const buf = await stream.read(5);
        expect(buf.toString("utf-8")).to.equal("hello");
    });

    it("should read data correctly after seeking", async () =>
    {
        // should seek correctly
        expect(await stream.seek(2)).to.be.true;
        expect(stream.position).to.equal(2);

        // and read the data
        const buf = await stream.read(2);
        expect(buf.toString("utf-8")).to.equal("ll");
    });

    it("should not write data", async () =>
    {
        expect(async () =>
        {
            const buf = Buffer.from("adios");
            await stream.write(buf);
        }).to.throw;
    });

    it("should not allow operations after closing", async () =>
    {
        expect(async () =>
        {
            await stream.close();
            await stream.seek(2);
        }).to.throw;

        expect(async () =>
        {
            await stream.close();
            await stream.read(2);
        }).to.throw;
    });
});

describe("fixed-size memory streams", () =>
{
    let stream!: MemoryStream;

    beforeEach(async () =>
    {
        const buf = Buffer.from("hello");

        stream = new MemoryStream({ data: buf, fixedSize: false });
    });

    afterEach(async () => 
    {
        await stream.close();
    });

    it("should write data correctly", async () =>
    {
        let buf = Buffer.from("adios");
        expect(await stream.write(buf)).to.equal(5);
        await stream.seek(0);

        buf = await stream.read(5);
        expect(buf.toString("utf-8")).to.equal("adios");
    });

    it("should write data correctly after seeking", async () =>
    {
        let buf = Buffer.from("ww");
        expect(await stream.seek(2)).to.be.true;
        expect(await stream.write(buf)).to.equal(2);

        await stream.seek(0);
        buf = await stream.read(5);
        expect(buf.toString("utf-8")).to.equal("hewwo");
    });

    it("should not write data that exceeds its size", async () =>
    {
        expect(async () =>
        {
            const buf = Buffer.from("wwww");
            expect(await stream.seek(2)).to.be.true;
            expect(await stream.write(buf)).to.equal(2);
        }).to.throw;
    });
});