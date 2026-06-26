import asyncio
from playwright.async_api import async_playwright
import os

async def capture_gallery():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 2560, 'height': 1440})

        print("Navigating to app...")
        try:
            await page.goto('http://localhost:5173', timeout=30000)
            await page.wait_for_load_state('networkidle')
            print("Page loaded.")
        except Exception as e:
            print(f"Initial navigation failed: {e}")
            await browser.close()
            return

        os.makedirs('verification/gallery', exist_ok=True)

        # 1. Select Protocol
        try:
            protocol_btn = page.locator("button").filter(has_text="ADULT CARDIAC ARREST").first
            await protocol_btn.wait_for(state="visible", timeout=5000)
            await protocol_btn.click()
            print("Selected Protocol.")
            await asyncio.sleep(1)
        except Exception as e:
            print(f"Failed protocol select: {e}")

        # 2. Arrive on Scene
        try:
            arrive_btn = page.locator("button").filter(has_text="ARRIVE ON SCENE").first
            await arrive_btn.wait_for(state="visible", timeout=5000)
            await arrive_btn.click()
            print("Arrived on scene.")
            await asyncio.sleep(1)
        except:
            pass

        # 3. Complete Scene Sizeup
        sizeup_cards = [
            "BSI / SCENE SAFETY",
            "MOI / NOI DETERMINATION",
            "NUMBER OF PATIENTS",
            "ADDITIONAL RESOURCES (ALS)"
        ]
        for card in sizeup_cards:
            try:
                card_btn = page.get_by_text(card).first
                await card_btn.wait_for(state="visible", timeout=2000)
                await card_btn.click(force=True)
                print(f"Clicked sizeup: {card}")
                await asyncio.sleep(0.3)
            except:
                pass

        # 4. Patient Contact
        try:
            contact_btn = page.locator("button").filter(has_text="PATIENT CONTACT").first
            await contact_btn.wait_for(state="visible", timeout=5000)
            await contact_btn.click()
            print("Patient contact established.")
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Failed patient contact: {e}")

        await page.screenshot(path='verification/gallery/00_hud_active.png', full_page=True)

        hud_buttons = [
            "REVIEW", "CHART", "STUDY MODE", "HANDOVER", "12-LEAD", "DIAGS", "POCUS", "CONSULT",
            "GUIDE", "TRENDS", "BAG", "HISTORY", "EXAM", "TEAM", "RADIOLOGY", "VASCULAR",
            "MATERNAL", "TCCC", "TOX", "FLIGHT", "CARDIOLOGY", "CBRNE", "BURN", "CAREER"
        ]

        close_patterns = [
            "Return to Mission",
            "Return to Simulation",
            "Back to Zone",
            "Exit Suite",
            "Return",
            "✕",
            "Confirm TBSA & Log",
            "Return to Patient Care",
            "Close"
        ]

        for i, btn_text in enumerate(hud_buttons):
            print(f"--- Processing {btn_text} ---")
            try:
                # We use a more generic text match to handle children elements
                success = await page.evaluate(f"""(text) => {{
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const target = buttons.find(b => b.innerText.toUpperCase().includes(text.toUpperCase()));
                    if (target) {{
                        target.click();
                        return true;
                    }}
                    return false;
                }}""", btn_text)

                if success:
                    print(f"Opened {btn_text} via JS click")
                    await asyncio.sleep(2)
                    path = f'verification/gallery/{i+1:02d}_{btn_text.lower().replace(" ","_")}.png'
                    await page.screenshot(path=path)
                    print(f"Captured {path}")

                    # Close it
                    closed = False
                    for pattern in close_patterns:
                        close_success = await page.evaluate(f"""(text) => {{
                            const buttons = Array.from(document.querySelectorAll('button'));
                            const target = buttons.find(b => b.innerText.toUpperCase().includes(text.toUpperCase()));
                            if (target && target.offsetParent !== null) {{
                                target.click();
                                return true;
                            }}
                            return false;
                        }}""", pattern)
                        if close_success:
                            closed = True
                            print(f"Closed {btn_text} with {pattern}")
                            break

                    if not closed:
                        await page.keyboard.press("Escape")
                        print(f"Closed {btn_text} with Escape")
                else:
                    print(f"Could not find button with text {btn_text}")

                await asyncio.sleep(1)

            except Exception as e:
                print(f"Failed {btn_text}: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_gallery())
