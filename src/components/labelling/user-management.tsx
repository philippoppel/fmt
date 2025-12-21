"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Loader2,
  UserCog,
  Shield,
  Tag,
  FileText,
} from "lucide-react";
import { createLabeller, updateUserRole, deleteLabeller } from "@/lib/actions/labelling/admin";
import type { UserRole } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  _count: {
    ratedLabels: number;
    createdCases: number;
  };
}

interface UserManagementProps {
  users: User[];
  currentUserId: string;
}

export function UserManagement({ users, currentUserId }: UserManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"LABELLER" | "ADMIN">("LABELLER");

  const handleCreate = async () => {
    setError(null);
    startTransition(async () => {
      const result = await createLabeller({
        email: formEmail,
        name: formName,
        password: formPassword,
        role: formRole,
      });

      if (result.success) {
        setIsCreateOpen(false);
        setFormEmail("");
        setFormName("");
        setFormPassword("");
        setFormRole("LABELLER");
        router.refresh();
      } else {
        setError(result.error || "Fehler beim Erstellen");
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Benutzer wirklich löschen?")) return;
    startTransition(async () => {
      const result = await deleteLabeller(userId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Button */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Benutzer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Labeller erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="labeller@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label>Passwort</Label>
                <Input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                />
              </div>
              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as "LABELLER" | "ADMIN")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LABELLER">Labeller</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isPending || !formEmail || !formName || formPassword.length < 8}
              >
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzer ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {user.role === "ADMIN" ? (
                      <Shield className="h-5 w-5 text-primary" />
                    ) : (
                      <UserCog className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name || user.email}</p>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                      {user.id === currentUserId && (
                        <Badge variant="outline">Du</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {user._count.ratedLabels} Labels
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {user._count.createdCases} Fälle
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.id !== currentUserId && (
                    <>
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="LABELLER">Labeller</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {user._count.ratedLabels === 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center py-6 text-muted-foreground">
                Keine Labeller vorhanden
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
