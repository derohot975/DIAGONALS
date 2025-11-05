#!/bin/bash

# Rollback script for VoteScrollPicker
# Usage: ./rollback_vote_modal.sh

echo "🔄 Rolling back VoteScrollPicker to working version..."

# Backup current version
cp client/src/components/VoteScrollPicker.tsx client/src/components/VoteScrollPicker_scroll_version.tsx

# Restore working version
cp client/src/components/VoteScrollPicker_working_backup.tsx client/src/components/VoteScrollPicker.tsx

echo "✅ Rollback completed!"
echo "📁 Current version backed up as: VoteScrollPicker_scroll_version.tsx"
echo "🔧 Working version restored from: VoteScrollPicker_working_backup.tsx"

# Test build
echo "🧪 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Rollback completed successfully."
else
    echo "❌ Build failed! Please check for errors."
fi
