import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { actions } from "@/lib/pair/store";
import type { DateType } from "@/lib/pair/types";
import { Chip, Field } from "./primitives";

const TYPES: DateType[] = ["Coffee", "Lunch", "Dinner", "Walk", "Museum", "Activity", "Other"];

export function DatePlanner({ matchId, name, open, onOpenChange }: { matchId: string; name: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [type, setType] = useState<DateType>("Coffee");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("18:00");
  const [note, setNote] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const valid = venue.trim() && date >= today && time;

  function send() {
    if (!valid) return;
    actions.proposeDate({ matchId, type, venue: venue.trim(), address: address.trim(), date, time, note: note.trim() });
    toast.success(`Invitation sent to ${name}`);
    onOpenChange(false);
    setVenue(""); setAddress(""); setNote("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plan a date with {name}</DialogTitle>
          <DialogDescription>Pick somewhere public for a first meeting.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => <Chip key={t} selected={type === t} onClick={() => setType(t)}>{t}</Chip>)}
          </div>
          <Field label="Venue" htmlFor="venue"><Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Devoción" /></Field>
          <Field label="Address" htmlFor="addr"><Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="optional" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="dt"><Input id="dt" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Time" htmlFor="tm"><Input id="tm" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          </div>
          <Field label="Note" htmlFor="note"><Textarea id="note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <Button className="w-full" disabled={!valid} onClick={send}>Send invitation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
