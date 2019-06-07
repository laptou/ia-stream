import { FileStream } from "./file";
import { expect } from "chai";
import { resolve } from "path";
import { promises as fs } from "fs";

describe("file streams (w+)", () =>
{
    const path = resolve(__dirname, "../test/testfile");
    let stream!: FileStream;

    beforeEach(async () =>
    {
        await fs.writeFile(path, Buffer.from("every day that you're walking down the street"));

        stream = await FileStream.open(path, { flags: "r+" });
    });

    afterEach(async () => 
    {
        await stream.close();
        await fs.unlink(path);
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
        expect(stream.length).to.equal(45);
    });

    it("should read data correctly", async () =>
    {
        const buf = await stream.read(5);
        expect(buf.toString("utf-8")).to.equal("every");
    });

    it("should read data correctly after seeking", async () =>
    {
        // should seek correctly
        expect(await stream.seek(2)).to.be.true;
        expect(stream.position).to.equal(2);

        // and read the data
        const buf = await stream.read(2);
        expect(buf.toString("utf-8")).to.equal("er");
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
        expect(buf.toString("utf-8")).to.equal("evadios");
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