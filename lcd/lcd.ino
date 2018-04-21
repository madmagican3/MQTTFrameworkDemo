//Include the included libraries needed
#include <LiquidCrystal.h>

//Setup of the LCD Display, defining all ports used
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
    Serial.begin(9600);
    lcd.begin(16, 2);
    lcd.print("....Starting....");
    lcd.setCursor(0, 1);
    lcd.print("..Please Wait...");
    lcd.setCursor(0, 0);
}

void loop() {
  //This loop waits until there is serial data available
  if (Serial.available() > 0) {
    lcd.print("                ");
    lcd.setCursor(0, 1);
    lcd.print("                ");
    lcd.setCursor(0, 0);
    outputInput(Serial.parseInt());
  }
}

void outputInput(int input) {
  lcd.print("Temperature:     ");
  lcd.setCursor(0, 1);
  lcd.print(input);
  lcd.setCursor(0, 0);
}

