#!/bin/bash

# Only bump on Release builds (Archive uses Release configuration)
if [ "$CONFIGURATION" == "Release" ]; then
  echo "Bumping build version..."
  plist="$PROJECT_DIR/App/Info.plist"
  
  # Check if plist exists
  if [ ! -f "$plist" ]; then
      echo "Info.plist not found at $plist"
      exit 1
  fi

  # Get current build version
  buildNumber=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" "$plist")
  
  # Increment
  newBuildNumber=$(($buildNumber + 1))
  
  # Update plist
  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $newBuildNumber" "$plist"
  
  echo "Bumped version from $buildNumber to $newBuildNumber"
else
  echo "Not a Release build, skipping version bump."
fi

