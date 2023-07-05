from sys import argv
import gps
import json
from icm20948 import ICM20948
import math
from time import sleep

print("""magnetometer.py - Convert raw values to heading
Rotate the sensor (X-axis upwards) through 360 degrees to calibrate.
Press Ctrl+C to exit!
""")

X = 0
Y = 1
Z = 2

# The two axes which relate to heading, depends on orientation of the sensor
# Think Left & Right, Forwards and Back, ignoring Up and Down
AXES = Y, Z

# Initialise the imu
imu = ICM20948()

# Store an initial two readings from the Magnetometer
amin = list(imu.read_magnetometer_data())
amax = list(imu.read_magnetometer_data())


session = gps.gps(host="localhost", port="2947")
session.stream(gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)


def getLatLong():
    data = {}
    rep = session.next()
    try :
        if (rep["class"] == "TPV") :
            lat = str(rep.lat)
            long = str(rep.lon)
            print(lat + long)
            for information in ["lat", "long"]:      #(1)
                data[information] = eval(information)  #(2)

            with open("pos.json", "w") as outfile:
                json.dump(data, outfile)
    except Exception as e :
        print("Got exception " + str(e))

def getSpeed():
    data = {}
    rep = session.next()
    try :
        if (rep["class"] == "TPV") :
            spd = int(rep.speed)
            spd = spd*0.54
            spdKn = round(spd, 1)
            print(spdKn)
            for information in ["spdKn"]:      #(1)
                data[information] = eval(information)  #(2)

            with open("speed.json", "w") as outfile:
                json.dump(data, outfile)
    except Exception as e :
        print("Got exception " + str(e))

def getHeading():
    mag = list(imu.read_magnetometer_data())

    for i in range(3):
        v = mag[i]
        if v < amin[i]:
            amin[i] = v

        if v > amax[i]:
            amax[i] = v
        
        mag[i] -= amin[i]

        try:
            mag[i] /= amax[i] - amin[i]
        except ZeroDivisionError:
            pass

        mag[i] -= 0.5

    heading = math.atan2(
            mag[AXES[0]],
            mag[AXES[1]])

    if heading < 0:
        heading += 2 * math.pi
        
    heading = math.degrees(heading)
    heading = round(heading)

    print("Heading: {}".format(heading))
    data = {}
    for information in ["heading"]:      #(1)
            data[information] = eval(information)  #(2)

            with open("heading.json", "w") as outfile:
                json.dump(data, outfile)

while True: 
        getSpeed()
        getLatLong()
        getHeading()
        sleep(0.5)