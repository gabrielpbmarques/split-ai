import { LoadPdfService } from 'src/modules/sources/load-pdf/load-pdf.service';

describe('LoadPdfService', () => {
  it('writes the buffer to a temp file, extracts chunks and removes the file', async () => {
    const processPdfService = {
      execute: jest.fn().mockResolvedValue([{ pageContent: 'chunk' }]),
    };
    const service = new LoadPdfService(processPdfService as any);

    const chunks = await service.execute(Buffer.from('%PDF-1.4'));

    expect(chunks).toEqual([{ pageContent: 'chunk' }]);
    expect(processPdfService.execute).toHaveBeenCalledWith(
      expect.stringMatching(/temp\.pdf$/),
    );
  });
});
