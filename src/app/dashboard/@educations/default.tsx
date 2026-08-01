/* Next 16 requires every parallel route slot to define a default, and fails the build otherwise.
   This slot renders content rather than an overlay, so it renders nothing when the router cannot
   recover its active state - matching the behavior Next applied implicitly before v16. */
export default function Default() {
  return null;
}
