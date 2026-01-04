import Job from "./models/job.model.js";

export async function enqueuePdfJob(data) {
  await Job.create({
    type: "pdf_process",
    payload: data,
  });
}