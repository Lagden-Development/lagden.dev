// app/api/project-status/route.ts
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusId = searchParams.get("statusId");

  if (!statusId) {
    return new Response(
      JSON.stringify({ error: "statusId query parameter is required" }),
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      "https://uptime.betterstack.com/api/v2/monitors",
      {
        headers: {
          Authorization: `Bearer ${process.env.BETTERSTACK_API_TOKEN}`,
        },
      }
    );

    const monitor = response.data.data.find(
      (monitor: { id: string }) => monitor.id === statusId
    );

    if (!monitor) {
      return new Response(JSON.stringify({ error: "Monitor not found" }), {
        status: 404,
      });
    }

    const responseTimes = await axios.get(
      `https://uptime.betterstack.com/api/v2/monitors/${statusId}/response-times`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BETTERSTACK_API_TOKEN}`,
        },
      }
    );

    return new Response(
      JSON.stringify({
        ...monitor.attributes,
        response_times: responseTimes.data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error fetching monitor status" }),
      { status: 500 }
    );
  }
}
