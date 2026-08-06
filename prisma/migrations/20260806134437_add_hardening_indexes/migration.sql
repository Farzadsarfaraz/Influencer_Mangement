-- CreateIndex
CREATE INDEX "ApprovalRequest_stage_decision_idx" ON "ApprovalRequest"("stage", "decision");

-- CreateIndex
CREATE INDEX "Conversation_influencerId_idx" ON "Conversation"("influencerId");

-- CreateIndex
CREATE INDEX "Deliverable_status_dueDate_idx" ON "Deliverable"("status", "dueDate");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");
