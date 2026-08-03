/**
 * Renders nothing when the router cannot recover the active state of this parallel route slot.
 *
 * Next 16 requires every parallel route slot to define a default and fails the build otherwise.
 * This slot renders content rather than an overlay, so its default renders nothing.
 */
const Default = () => null;

export default Default;
