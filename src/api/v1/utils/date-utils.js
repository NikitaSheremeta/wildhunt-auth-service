const magicNumbers = {
  nineteenthCharacter: 19,
  oneSecond: 1000,
  oneMinute: 60
};

class DateUtils {
  get magicNumbers() {
    return magicNumbers;
  }

  convertIsoToTimestamp(isoDate) {
    const dateString = isoDate.toISOString();

    return dateString
      .slice(0, magicNumbers.nineteenthCharacter)
      .replace('T', ' ');
  }

  convertIsoToMilliseconds(isoDate) {
    const timestamp = this.convertIsoToTimestamp(isoDate);

    return new Date(timestamp).getTime() / magicNumbers.oneSecond;
  }

  getDifferenceInTime(date, time) {
    const currentDate = Math.round(Date.now() / magicNumbers.oneSecond);

    const timeOffset =
      Math.abs(new Date().getTimezoneOffset()) * magicNumbers.oneMinute;

    return currentDate - (date + timeOffset) < time;
  }
}

module.exports = new DateUtils();
