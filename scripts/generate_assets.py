"""
Asset generation script for StrideSync mobile app.
Generates production-grade PNG assets from mathematical vectors using PIL/Pillow.
Output:
- assets/icon.png (1024x1024, iOS/main app icon, no alpha)
- assets/adaptive-icon.png (1024x1024, Android foreground with alpha, safe zone centered)
- assets/adaptive-icon-monochrome.png (1024x1024, Android 13+ themed icon, pure white on transparent)
- assets/splash-icon.png (1024x1024, splash emblem)
- assets/notification-icon.png (96x96, monochrome status bar icon)
- assets/favicon.png (48x48, web favicon)
"""

import math
import os
from PIL import Image, ImageDraw

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

def draw_gradient_background(draw, width, height, start_color, end_color):
    """Draws a smooth diagonal linear gradient."""
    for y in range(height):
        for x in range(width):
            factor = (x + y) / (width + height)
            r = int(start_color[0] + factor * (end_color[0] - start_color[0]))
            g = int(start_color[1] + factor * (end_color[1] - start_color[1]))
            b = int(start_color[2] + factor * (end_color[2] - start_color[2]))
            draw.point((x, y), fill=(r, g, b))

def draw_progress_ring(draw, center, radius, thickness, color, start_angle=-90, end_angle=180):
    """Draws a smooth circular progress arc."""
    bbox = [center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius]
    draw.arc(bbox, start_angle, end_angle, fill=color, width=thickness)

def draw_stylized_footsteps(draw, cx, cy, scale=1.0, color=(255, 255, 255)):
    """Draws a pair of stylized geometric runner footsteps with forward motion."""
    # Left foot (slightly behind)
    lx = cx - int(45 * scale)
    ly = cy + int(20 * scale)
    # Sole
    draw.ellipse([lx - int(25 * scale), ly - int(55 * scale), lx + int(25 * scale), ly + int(10 * scale)], fill=color)
    # Heel
    draw.ellipse([lx - int(20 * scale), ly + int(25 * scale), lx + int(20 * scale), ly + int(65 * scale)], fill=color)

    # Right foot (forward, leading stride)
    rx = cx + int(45 * scale)
    ry = cy - int(40 * scale)
    # Sole
    draw.ellipse([rx - int(25 * scale), ry - int(55 * scale), rx + int(25 * scale), ry + int(10 * scale)], fill=color)
    # Heel
    draw.ellipse([rx - int(20 * scale), ry + int(25 * scale), rx + int(20 * scale), ry + int(65 * scale)], fill=color)

    # Forward lightning/energy spark
    spark = [
        (cx + int(90 * scale), cy - int(120 * scale)),
        (cx + int(70 * scale), cy - int(80 * scale)),
        (cx + int(105 * scale), cy - int(80 * scale)),
        (cx + int(80 * scale), cy - int(40 * scale)),
    ]
    draw.line(spark, fill=color, width=max(2, int(8 * scale)))

def generate_icon_png():
    """Generates 1024x1024 iOS app icon (RGB, no transparency)."""
    img = Image.new("RGB", (1024, 1024), color=(15, 23, 42)) # Deep Midnight Navy
    draw = ImageDraw.Draw(img)

    # Fast vertical/diagonal gradient fill
    start_c = (16, 185, 129) # Emerald #10B981
    end_c = (14, 165, 233)   # Sky #0EA5E9
    for y in range(1024):
        f = y / 1024.0
        r = int(start_c[0] * (1 - f) + end_c[0] * f)
        g = int(start_c[1] * (1 - f) + end_c[1] * f)
        b = int(start_c[2] * (1 - f) + end_c[2] * f)
        draw.line([(0, y), (1024, y)], fill=(r, g, b))

    # Darker inner circle card for depth
    inner_bbox = [140, 140, 884, 884]
    draw.ellipse(inner_bbox, fill=(11, 15, 25))

    # Outer progress ring track
    draw_progress_ring(draw, (512, 512), 310, 40, (30, 41, 59), 0, 360)
    # Active progress ring arc (accented in vibrant neon green/cyan)
    draw_progress_ring(draw, (512, 512), 310, 40, (52, 211, 153), -90, 190)

    # Center footsteps
    draw_stylized_footsteps(draw, 512, 512, scale=2.2, color=(255, 255, 255))

    path = os.path.join(ASSETS_DIR, "icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_adaptive_foreground_png():
    """Generates 1024x1024 Android adaptive icon foreground (transparent, safe zone in center ~66%)."""
    img = Image.new("RGBA", (1024, 1024), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Safe zone is roughly r=240px from center (512, 512)
    # Glowing ring
    draw_progress_ring(draw, (512, 512), 230, 32, (16, 185, 129, 255), 0, 360)
    draw_progress_ring(draw, (512, 512), 230, 32, (56, 189, 248, 255), -90, 170)

    # Footsteps centered within safe zone
    draw_stylized_footsteps(draw, 512, 512, scale=1.6, color=(255, 255, 255, 255))

    path = os.path.join(ASSETS_DIR, "adaptive-icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_adaptive_monochrome_png():
    """Generates 1024x1024 Android 13+ monochrome icon (pure white silhouette on transparent)."""
    img = Image.new("RGBA", (1024, 1024), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw_progress_ring(draw, (512, 512), 230, 30, (255, 255, 255, 255), 0, 360)
    draw_stylized_footsteps(draw, 512, 512, scale=1.6, color=(255, 255, 255, 255))

    path = os.path.join(ASSETS_DIR, "adaptive-icon-monochrome.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_splash_icon_png():
    """Generates splash emblem (1024x1024 with transparent background)."""
    img = Image.new("RGBA", (1024, 1024), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw_progress_ring(draw, (512, 512), 260, 36, (16, 185, 129, 255), -90, 200)
    draw_stylized_footsteps(draw, 512, 512, scale=1.8, color=(255, 255, 255, 255))

    path = os.path.join(ASSETS_DIR, "splash-icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_notification_icon_png():
    """Generates 96x96 small monochrome notification icon for Android status bar."""
    img = Image.new("RGBA", (96, 96), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw_progress_ring(draw, (48, 48), 34, 6, (255, 255, 255, 255), 0, 360)
    draw_stylized_footsteps(draw, 48, 48, scale=0.25, color=(255, 255, 255, 255))

    path = os.path.join(ASSETS_DIR, "notification-icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_favicon_png():
    """Generates 48x48 web favicon."""
    img = Image.new("RGBA", (48, 48), color=(16, 185, 129, 255))
    draw = ImageDraw.Draw(img)

    draw_progress_ring(draw, (24, 24), 16, 4, (255, 255, 255, 255), -90, 210)
    draw_stylized_footsteps(draw, 24, 24, scale=0.12, color=(255, 255, 255, 255))

    path = os.path.join(ASSETS_DIR, "favicon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

if __name__ == "__main__":
    generate_icon_png()
    generate_adaptive_foreground_png()
    generate_adaptive_monochrome_png()
    generate_splash_icon_png()
    generate_notification_icon_png()
    generate_favicon_png()
    print("All assets generated successfully!")
