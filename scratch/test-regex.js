const hash = `#/player?src=https://kgs-new-v1.akamaized.net/kv3/apr-2026/531385/kgss-1775789788-v531385_720p2628kbs/index.m3u8?hdntl=exp%3D1780738095%7Eacl%3D%2F*%7Edata%3Dhdntl%7Ehmac%3D0a2133d4e3f79b4efb8bdc8df8ab4943b79bd1e1ea60ada80fc77bf85a37ab58&hdnts=exp%3D1780662495%7Eacl%3D%2Fkv3%2Fapr-2026%2F531385%2F*%7Edata%3Dttl%3D10800%7Ehmac%3De1a4c1070dee2d8ddd4d814a14423938173391ca3c774fd1a5f631adfb8ed6de`;

const qIndex = hash.indexOf("?");
const hashQuery = hash.slice(qIndex + 1);

const srcMatch = hashQuery.match(
  /src=([\s\S]*?)(?:&(?:accentColor|lowLatency|autoPlay|muted|customRates|disableDevOptions|debugTouchZones|poster|seekStep|liveSyncDuration|volumeControl|centerOverlayGap|objectFit|centerIconScale|safeAreaTop|safeAreaBottom|videoId)=|$)/,
);

console.log("srcMatch matched:", !!srcMatch);
if (srcMatch) {
  console.log("srcMatch[1]:", srcMatch[1]);
  console.log("decoded:", decodeURIComponent(srcMatch[1]));
}
