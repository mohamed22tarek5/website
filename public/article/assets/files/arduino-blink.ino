/**
 * @file arduino-blink.ino
 * @brief Non-blocking LED blink with state machine & serial telemetry
 * @author Mohamed Tarek Abdelhady (M.T.A. Lab)
 */

const uint8_t LED_PIN = 13;
const unsigned long BLINK_INTERVAL = 500; // ms

unsigned long previousMillis = 0;
bool ledState = LOW;
uint32_t blinkCount = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, ledState);
  Serial.begin(115200);
  while (!Serial && millis() < 3000) { /* wait for serial port */ }
  Serial.println(F("[M.T.A. Lab] Non-blocking Blink Initialized"));
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= BLINK_INTERVAL) {
    previousMillis = currentMillis;
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    blinkCount++;

    if (blinkCount % 10 == 0) {
      Serial.print(F("Uptime (s): "));
      Serial.print(currentMillis / 1000);
      Serial.print(F(" | Toggles: "));
      Serial.println(blinkCount);
    }
  }

  // Your non-blocking application tasks can run freely here!
}
