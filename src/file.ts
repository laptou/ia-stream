/**
 * @module file
 */

import { promises as fs, PathLike, constants } from "fs";
import * as nodeStreams from "stream";
import { Stream, StreamBase } from "./stream";

type FileStreamOptions = {
    flags: string | number;
    substream: boolean;
    range: [number, number];
};

export class FileStream extends StreamBase
{
    private _file: fs.FileHandle | null;
    private _position: number = 0;
    private _range: [number, number];
    private _flags: string | number;
    private _isSubstream = false;

    private constructor(
        fd: fs.FileHandle,
        options: FileStreamOptions)
    {
        super();
        this._file = fd;
        this._flags = options.flags;
        this._isSubstream = options.substream;

        if (options.range[1] < options.range[0] ||
            options.range[0] < 0 ||
            options.range[1] < 0)
            throw new RangeError(`Invalid range ${options.range}.`);

        this._range = options.range;
        this._position = this._range[0];
    }

    public static async open(path: PathLike, options: { mode?: string, flags: string | number })
    {
        const fd = await fs.open(path, options.flags, options.mode);
        const stats = await fd.stat();

        const stream = new FileStream(fd, {
            flags: options.flags,
            substream: false,
            range: [0, stats.size]
        });

        return stream;
    }

    public get length() { return this._range[1] - this._range[0]; }

    public get position() { return this._position - this._range[0]; }

    public get canRead()
    {
        if (!this.isOpen) return false;

        if (typeof this._flags === "string")
        {
            // requires r or w+ to read
            return this._flags.includes("r") ||
                (this._flags.includes("w") && this._flags.includes("+"));
        }
        else 
        {
            return (this._flags & constants.O_RDONLY) === constants.O_RDONLY ||
                (this._flags & constants.O_RDWR) === constants.O_RDWR;
        }
    }

    public get canSeek()
    {
        if (!this.isOpen) return false;

        if (typeof this._flags === "string")
        {
            // requires r or w to read, but not a
            return this._flags.includes("r") || this._flags.includes("w");
        }
        else 
        {
            return (this._flags & constants.O_RDONLY) === constants.O_RDONLY ||
                (this._flags & constants.O_RDWR) === constants.O_RDWR;
        }
    }

    public get canWrite()
    {
        if (!this.isOpen) return false;
        if (this._isSubstream) return false;

        if (typeof this._flags === "string")
        {
            // requires w, a, or r+ to read
            return this._flags.includes("w") ||
                this._flags.includes("a") ||
                (this._flags.includes("r") && this._flags.includes("+"));
        }
        else 
        {
            return (this._flags & constants.O_RDWR) === constants.O_RDWR ||
                (this._flags & constants.O_APPEND) === constants.O_APPEND;
        }
    }

    public get isOpen() { return this._file !== null; }

    public async seek(position: number): Promise<boolean>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canSeek)
            throw new Error("This stream cannot be seeked.");

        if (position < 0 || position > this.length)
            return false;

        this._position = position + this._range[0];
        return true;
    }

    public async read(length: number, exact?: boolean): Promise<Buffer>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canRead)
            throw new Error("This stream cannot be read from.");

        if (exact && this.position + length > this.length)
            throw new Error(`Could not read ${length} bytes at position ${this.position}`);

        // use _position for the actual read b/c it is not offset by the range
        const buf = Buffer.alloc(length);
        const { bytesRead } = await this._file!.read(buf, 0, length, this._position);

        if (exact && bytesRead !== length)
            throw new Error(`Could not read ${length} bytes at position ${this.position}, only received ${bytesRead} bytes`);

        this._position += bytesRead;

        return buf;
    }

    // a single pread() syscall is faster than lseek() + read(), however we are keeping track of
    // the position in our class and not in the file descriptor anyway, so we aren't using lseek()
    // therefore overriding readFrom() and writeAt() is not necessary

    public async write(data: Buffer): Promise<number>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canWrite)
            throw new Error("This stream cannot be written to.");

        // use _position for the actual read b/c it is not offset by the range
        const { bytesWritten } = await this._file!.write(data, 0, data.length, this._position);
        this._position += bytesWritten;
        this._range[1] = Math.max(this._position, this._range[1]);

        return bytesWritten;
    }

    public async resize(length: number): Promise<boolean>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canWrite)
            throw new Error("This stream cannot be written to.");

        if (length === this.length) return true;

        await this._file!.truncate(length);
        return true;
    }

    public async close()
    {
        if (this._file)
        {
            await this._file.close();
            this._file = null;
        }

        super.close();
    }
}