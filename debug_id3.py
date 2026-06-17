from pathlib import Path
p = Path('Music/1.mp3')
if not p.exists():
    print('missing')
    raise SystemExit(1)
with p.open('rb') as f:
    b = f.read(10000)
print('len', len(b))
print('header', b[:10])
print('id3', b[:3])
if b[:3] == b'ID3':
    ver = b[3]
    rev = b[4]
    flags = b[5]
    size = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f)
    print('version', ver, rev, 'flags', flags, 'size', size)
    pos = 10
    while pos < 10 + size:
        frame = b[pos:pos+4].decode('latin1')
        if frame == '\x00\x00\x00\x00':
            break
        if ver == 4:
            fsize = ((b[pos+4] & 0x7f) << 21) | ((b[pos+5] & 0x7f) << 14) | ((b[pos+6] & 0x7f) << 7) | (b[pos+7] & 0x7f)
        else:
            fsize = int.from_bytes(b[pos+4:pos+8], 'big')
        flags2 = b[pos+8:pos+10]
        print('frame', frame, 'size', fsize, 'flags', flags2)
        data = b[pos+10:pos+10+fsize]
        if frame in ('TIT2', 'TPE1', 'TALB'):
            print('text', data[:60])
        if frame == 'APIC':
            enc = data[0]
            mime_end = data.find(b'\x00', 1)
            print('apic enc', enc, 'mime', data[1:mime_end])
            pic_type = data[mime_end+1]
            desc_start = mime_end + 2
            desc_end = data.find(b'\x00', desc_start)
            print('desc', data[desc_start:desc_end], 'image len', len(data) - (desc_end + 1))
        pos += 10 + fsize
