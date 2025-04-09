// frontend/app/settings/linenotification/edit/[id]/page.js
"use client";

import LineNotificationEditPage from "../../../LineNotificationEditPage";

export default function Page({ params }) {
  return <LineNotificationEditPage id={params.id} />;
}