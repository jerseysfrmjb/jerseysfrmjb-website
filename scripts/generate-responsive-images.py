"""Generate mobile-friendly WebP inventory images.

Run after adding or replacing product photos:
  python scripts/generate-responsive-images.py
"""

from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "inventory"
OUTPUT = SOURCE / "responsive"
WIDTHS = (480, 900)
EXTENSIONS = {".jpg", ".jpeg", ".png"}


def generate(source: Path, width: int) -> Path:
    target = OUTPUT / f"{source.stem}-{width}.webp"
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        if image.width > width:
            height = max(1, round(image.height * width / image.width))
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=82, method=6)
    return target


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = sorted(path for path in SOURCE.iterdir() if path.is_file() and path.suffix.lower() in EXTENSIONS)
    written = 0
    for source in sources:
        for width in WIDTHS:
            generate(source, width)
            written += 1
    print(f"Generated {written} responsive images from {len(sources)} inventory photos.")


if __name__ == "__main__":
    main()
