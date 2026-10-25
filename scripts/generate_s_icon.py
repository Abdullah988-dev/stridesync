"""
Generates the colorful StrideSync 'S' ribbon logo and app assets
matching the vibrant icon in the user's notification reference image.
"""

import math
import os
from PIL import Image, ImageDraw, ImageFilter

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

def interpolate_color(c1, c2, factor):
    return (
        int(c1[0] + factor * (c2[0] - c1[0])),
        int(c1[1] + factor * (c2[1] - c1[1])),
        int(c1[2] + factor * (c2[2] - c1[2])),
    )

def get_ribbon_color(t):
    """
    Returns (R, G, B) along the ribbon t in [0, 1].
    t=0.0: Orange (#F97316: 249, 115, 22)
    t=0.25: Coral/Pink (#EC4899: 236, 72, 153)
    t=0.5: Purple (#8B5CF6: 139, 92, 246)
    t=0.75: Blue/Cyan (#06B6D4: 6, 182, 212)
    t=1.0: Emerald (#10B981: 16, 185, 129)
    """
    stops = [
        (0.00, (249, 115, 22)),   # Orange
        (0.25, (236, 72, 153)),   # Pink
        (0.50, (139, 92, 246)),   # Purple
        (0.75, (6, 182, 212)),    # Cyan
        (1.00, (16, 185, 129)),   # Emerald
    ]
    for i in range(len(stops) - 1):
        t1, c1 = stops[i]
        t2, c2 = stops[i + 1]
        if t1 <= t <= t2:
            local_factor = (t - t1) / (t2 - t1)
            return interpolate_color(c1, c2, local_factor)
    return stops[-1][1]

def draw_s_ribbon(draw, center, scale=1.0, radius=55):
    """
    Draws a continuous, smooth 'S' ribbon with vibrant color gradient.
    Scale 1.0 is sized for a 1024x1024 canvas.
    """
    cx, cy = center
    num_steps = 800
    points = []

    # Parametric curve for 'S' ribbon
    for i in range(num_steps + 1):
        t = i / float(num_steps)
        # S curve via cubic/sine blend
        angle = t * 2.2 * math.pi - 0.25 * math.pi
        # X sweeps left-right-left
        # Y goes from top to bottom
        y = cy + (t - 0.5) * 580 * scale
        x = cx + math.sin(angle) * 190 * scale

        points.append((x, y, t))

    # Draw continuous overlapping circles with gradient coloring
    r = int(radius * scale)
    for x, y, t in points:
        color = get_ribbon_color(t)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

def generate_icon_png():
    """Generates 1024x1024 app icon with dark rounded background and 'S' ribbon."""
    img = Image.new("RGB", (1024, 1024), color=(10, 15, 29)) # Dark sleek navy
    draw = ImageDraw.Draw(img)

    # Subtle radial glow behind the S
    glow_img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    draw_s_ribbon(glow_draw, (512, 512), scale=1.0, radius=85)
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(35))
    img.paste(glow_img, (0, 0), glow_img)

    # Crisp sharp S ribbon
    draw_img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    ribbon_draw = ImageDraw.Draw(draw_img)
    draw_s_ribbon(ribbon_draw, (512, 512), scale=1.0, radius=65)
    img.paste(draw_img, (0, 0), draw_img)

    path = os.path.join(ASSETS_DIR, "icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_adaptive_icon_png():
    """Android adaptive foreground icon."""
    img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Safe zone scale (around 0.72)
    draw_s_ribbon(draw, (512, 512), scale=0.72, radius=48)

    path = os.path.join(ASSETS_DIR, "adaptive-icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

def generate_notification_icon_png():
    """Small monochrome notification icon (96x96)."""
    img = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Simplified single-color 'S' ribbon for status bar
    cx, cy = 48, 48
    scale = 0.09
    r = 5
    for i in range(150):
        t = i / 150.0
        angle = t * 2.2 * math.pi - 0.25 * math.pi
        y = cy + (t - 0.5) * 580 * scale
        x = cx + math.sin(angle) * 190 * scale
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 255))

    path = os.path.join(ASSETS_DIR, "notification-icon.png")
    img.save(path, format="PNG")
    print(f"Generated {path}")

if __name__ == "__main__":
    generate_icon_png()
    generate_adaptive_icon_png()
    generate_notification_icon_png()
    print("All S-ribbon icon assets generated successfully!")
