import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser tab favicon — DPR brand mark (replaces any host default). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B3A82",
          color: "#E8F000",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        DPR
      </div>
    ),
    { ...size },
  );
}
